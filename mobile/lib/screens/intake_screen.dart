import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/encounter.dart';
import '../services/triage_calculator.dart';
import '../services/sync_service.dart';
import '../widgets/vitals_input_field.dart';
import '../widgets/priority_chip.dart';
import 'login_screen.dart';

class IntakeScreen extends StatefulWidget {
  final String workerName;
  final String workerPhone;

  const IntakeScreen({
    super.key,
    required this.workerName,
    required this.workerPhone,
  });

  @override
  State<IntakeScreen> createState() => _IntakeScreenState();
}

class _IntakeScreenState extends State<IntakeScreen> {
  late String _activeWorkerName;
  late String _activeWorkerPhone;

  // Demographics
  final _nameController = TextEditingController(text: "Pooja Verma");
  final _ageController = TextEditingController(text: "32");
  final _addressController = TextEditingController(text: "Sector 4, Rampur Rural PHC");
  String _selectedGender = "Female";

  // Biometrics
  final _heightController = TextEditingController(text: "162");
  final _weightController = TextEditingController(text: "58");

  // Symptoms Section
  final _chiefComplaintController = TextEditingController(text: "Severe lower leg trauma with active bleeding");
  final List<String> _availableSymptoms = [
    "Chest Pain",
    "Shortness of Breath",
    "High Fever",
    "Severe Bleeding",
    "Unconscious / Drowsy",
    "Deep Wound / Fracture",
    "Severe Abdominal Pain",
    "Vomiting / Dehydration",
  ];
  final Set<String> _selectedSymptoms = {"Severe Bleeding", "Deep Wound / Fracture"};

  // Vitals
  final _hrController = TextEditingController(text: "132");
  final _sbpController = TextEditingController(text: "88");
  final _spo2Controller = TextEditingController(text: "89");
  final _rrController = TextEditingController(text: "24");
  final _tempController = TextEditingController(text: "38.5");

  // Audio / Scribe Dialogue
  final _transcriptController = TextEditingController(
    text: "Patient was involved in a roadside farm machinery incident. Severe laceration on right lower leg with heavy blood loss. Complaining of dizziness and chills.",
  );

  // Wound Image
  String? _woundBase64;
  final ImagePicker _picker = ImagePicker();

  String _currentBadge = "GREEN";
  int _currentScore = 10;
  bool _isSyncing = false;
  String _networkState = "Offline Engine Ready";

  @override
  void initState() {
    super.initState();
    _activeWorkerName = widget.workerName;
    _activeWorkerPhone = widget.workerPhone;
    _recomputeTriage();
  }

  void _recomputeTriage() {
    final result = TriageCalculator.calculate(
      heartRate: int.tryParse(_hrController.text),
      systolicBp: int.tryParse(_sbpController.text),
      spo2: int.tryParse(_spo2Controller.text),
      symptoms: _selectedSymptoms.toList(),
      transcript: _transcriptController.text,
    );
    setState(() {
      _currentBadge = result.priority;
      _currentScore = result.score;
    });
  }

  double? _calculateBMI() {
    final h = double.tryParse(_heightController.text);
    final w = double.tryParse(_weightController.text);
    if (h != null && w != null && h > 0) {
      final hm = h / 100.0;
      return double.parse((w / (hm * hm)).toStringAsFixed(1));
    }
    return null;
  }

  // --- PHOTO ATTACHMENT DIALOG WITH REAL PICKER & SAMPLE LOAD ---
    Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 75,
      );

      if (photo != null) {
        final bytes = await photo.readAsBytes();
        if (!mounted) return; // <-- Guard before setState
        setState(() {
          _woundBase64 = "data:image/jpeg;base64,${base64Encode(bytes)}";
        });
      }
    } catch (e) {
      if (!mounted) return; // <-- FIX: Guard before accessing BuildContext across async gap
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Could not access camera/gallery: $e")),
      );
    }
  }
  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Attach Wound / Trauma Photo",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Colors.cyanAccent),
                title: const Text("Take Photo (Camera)", style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: Colors.cyanAccent),
                title: const Text("Choose from Gallery / Files", style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.medical_information, color: Colors.amberAccent),
                title: const Text("Load Sample Trauma Photo (For Testing/Emulators)", style: TextStyle(color: Colors.white)),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() {
                    // Pre-compressed 8KB realistic wound marker base64
                    _woundBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJAD/6pmkBSAAAAAElFTkSuQmCC";
                  });
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _removePhoto() {
    setState(() {
      _woundBase64 = null;
    });
  }

    void _resetForm() {
    setState(() {
      // 1. Clear Demographics
      _nameController.clear();
      _ageController.clear();
      _addressController.clear();
      _selectedGender = "Female";

      // 2. Clear Biometrics
      _heightController.clear();
      _weightController.clear();

      // 3. Clear Chief Complaint & Symptoms Checklist
      _chiefComplaintController.clear();
      _selectedSymptoms.clear();

      // 4. Clear Point-of-Care Vitals
      _hrController.clear();
      _sbpController.clear();
      _spo2Controller.clear();
      _rrController.clear();
      _tempController.clear();

      // 5. Clear Dialogue & Wound Image
      _transcriptController.clear();
      _woundBase64 = null;

      // 6. Reset Triage Calculation to baseline GREEN (Score: 10)
      _recomputeTriage();
    });
  }
  
  void _showEditWorkerDialog() {
    final editController = TextEditingController(text: _activeWorkerName);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Worker Identity & Session", style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Logged in: +91 $_activeWorkerPhone", style: const TextStyle(color: Color(0x0090A1B9), fontSize: 12)),
            const SizedBox(height: 12),
            TextField(
              controller: editController,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: const InputDecoration(labelText: "Worker Full Name", border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const MobileLoginScreen()),
              );
            },
            child: const Text("Logout", style: TextStyle(color: Colors.redAccent)),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() => _activeWorkerName = editController.text.trim());
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF06B6D4)),
            child: const Text("Save", style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

    Future<void> _handleSync() async {
    // Basic validation so an empty form isn't sent
    if (_nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter patient name before transmitting")),
      );
      return;
    }

    setState(() {
      _isSyncing = true;
      _networkState = "Dispatching triage encounter...";
    });

    final encounter = PatientEncounterModel(
      submittedByName: _activeWorkerName,
      submittedByPhone: _activeWorkerPhone,
      patientName: _nameController.text.trim(),
      age: int.tryParse(_ageController.text.trim()) ?? 0,
      gender: _selectedGender,
      address: _addressController.text.trim().isEmpty 
          ? "Rural PHC Sector" 
          : _addressController.text.trim(),
      heightCm: double.tryParse(_heightController.text.trim()),
      weightKg: double.tryParse(_weightController.text.trim()),
      chiefComplaint: _chiefComplaintController.text.trim().isEmpty
          ? "General Examination"
          : _chiefComplaintController.text.trim(),
      symptoms: _selectedSymptoms.toList(),
      rawTranscript: _transcriptController.text.trim(),
      woundImageBase64: _woundBase64,
      vitals: PatientVitalsModel(
        heartRate: int.tryParse(_hrController.text.trim()),
        systolicBp: int.tryParse(_sbpController.text.trim()),
        spo2: int.tryParse(_spo2Controller.text.trim()),
        respiratoryRate: int.tryParse(_rrController.text.trim()),
        temperatureC: double.tryParse(_tempController.text.trim()),
      ),
    );

    final result = await SyncService.dispatchEncounter(encounter);

    if (!mounted) return;

    setState(() {
      _isSyncing = false;
      _networkState = result["message"];
    });

    // --- RESET FORM IF TRANSMISSION WAS SUCCESSFUL ---
    if (result["success"] == true) {
      _resetForm();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.teal,
          content: Text("Encounter transmitted! Form cleared for next patient."),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bmi = _calculateBMI();

    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onTap: _showEditWorkerDialog,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_activeWorkerName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
              Text("📱 +91 $_activeWorkerPhone (Tap to edit)", style: const TextStyle(fontSize: 10, color: Colors.cyanAccent)),
            ],
          ),
        ),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: Center(
              child: PriorityChip(
                priority: _currentBadge,
                score: _currentScore,
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status bar
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text("Status: $_networkState", style: const TextStyle(color: Colors.cyanAccent, fontSize: 12)),
            ),
            const SizedBox(height: 16),

            // Demographics Section
            const Text("1. PATIENT DEMOGRAPHICS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextField(
                    controller: _nameController,
                    style: const TextStyle(fontSize: 14),
                    decoration: const InputDecoration(labelText: "Full Name", border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 1,
                  child: TextField(
                    controller: _ageController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(fontSize: 14),
                    decoration: const InputDecoration(labelText: "Age", border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _selectedGender,
                  dropdownColor: const Color(0xFF1E293B),
                  items: ["Female", "Male", "Other"].map((g) => DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(fontSize: 13)))).toList(),
                  onChanged: (val) => setState(() => _selectedGender = val ?? "Female"),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _addressController,
              style: const TextStyle(fontSize: 14),
              decoration: const InputDecoration(labelText: "Address / Village / Sector", border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),

            // Biometrics Section
            Row(
              children: [
                const Text("2. BIOMETRICS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
                const Spacer(),
                Text(bmi != null ? "Calculated BMI: $bmi kg/m²" : "BMI: --", style: const TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                VitalsInputField(controller: _heightController, label: "HEIGHT (cm)", onChanged: () => setState(() {})),
                const SizedBox(width: 8),
                VitalsInputField(controller: _weightController, label: "WEIGHT (kg)", onChanged: () => setState(() {})),
              ],
            ),
            const SizedBox(height: 16),

            // --- SYMPTOMS & CHIEF COMPLAINTS SECTION ---
            const Text("3. CHIEF COMPLAINT & SYMPTOMS CHECKLIST", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
            const SizedBox(height: 8),
            TextField(
              controller: _chiefComplaintController,
              style: const TextStyle(fontSize: 14),
              decoration: const InputDecoration(
                labelText: "Primary Chief Complaint",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6.0,
              runSpacing: 6.0,
              children: _availableSymptoms.map((symptom) {
                final isSelected = _selectedSymptoms.contains(symptom);
                return FilterChip(
                  label: Text(symptom, style: TextStyle(fontSize: 11, color: isSelected ? Colors.black : Colors.white)),
                  selected: isSelected,
                  selectedColor: const Color(0xFF38BDF8),
                  backgroundColor: const Color(0xFF1E293B),
                  checkmarkColor: Colors.black,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedSymptoms.add(symptom);
                      } else {
                        _selectedSymptoms.remove(symptom);
                      }
                      _recomputeTriage();
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Point-of-Care Vitals
            const Text("4. POINT-OF-CARE VITALS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
            const SizedBox(height: 8),
            Row(
              children: [
                VitalsInputField(controller: _hrController, label: "HR (bpm)", onChanged: _recomputeTriage),
                const SizedBox(width: 8),
                VitalsInputField(controller: _sbpController, label: "SYS BP", onChanged: _recomputeTriage),
                const SizedBox(width: 8),
                VitalsInputField(controller: _spo2Controller, label: "SpO2 %", onChanged: _recomputeTriage),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                VitalsInputField(controller: _rrController, label: "RR (/min)", onChanged: _recomputeTriage),
                const SizedBox(width: 8),
                VitalsInputField(controller: _tempController, label: "TEMP (°C)", onChanged: _recomputeTriage),
              ],
            ),
            const SizedBox(height: 16),

            // Ambient Scribe / Dialogue
            const Text("5. AMBIENT SCRIBE / CONSULTATION DIALOGUE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
            const SizedBox(height: 6),
            TextField(
              controller: _transcriptController,
              maxLines: 3,
              onChanged: (_) => _recomputeTriage(),
              decoration: const InputDecoration(
                hintText: "Enter dialogue or patient complaints...",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // --- REAL WOUND PHOTO PICKER & PREVIEW ---
            const Text("6. VISUAL TRAUMA / WOUND INSPECTION", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.cyanAccent)),
            const SizedBox(height: 8),

            if (_woundBase64 == null)
              OutlinedButton.icon(
                onPressed: _showImageSourceDialog,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF38BDF8)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                icon: const Icon(Icons.camera_alt, color: Color(0xFF38BDF8)),
                label: const Text("Take Photo or Upload Injury Image", style: TextStyle(color: Color(0xFF38BDF8))),
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.cyanAccent),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.memory(
                        base64Decode(_woundBase64!.split(',').last),
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          width: 70,
                          height: 70,
                          color: const Color(0x4DFF5252),
                          child: const Icon(Icons.broken_image, color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Photo Attached ✓", style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 13)),
                          Text("Ready for physician inspection", style: TextStyle(color: Color(0x0090A1B9), fontSize: 11)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                      tooltip: "Remove Photo",
                      onPressed: _removePhoto,
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, color: Colors.cyanAccent),
                      tooltip: "Retake / Change",
                      onPressed: _showImageSourceDialog,
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton(
              onPressed: _isSyncing ? null : _handleSync,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF06B6D4),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(
                _isSyncing ? "Syncing..." : "Transmit to Command Board",
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
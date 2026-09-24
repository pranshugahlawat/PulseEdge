class PatientVitalsModel {
  final int? heartRate;
  final int? systolicBp;
  final int? diastolicBp;
  final int? spo2;
  final int? respiratoryRate;
  final double? temperatureC;
  final String consciousness;

  PatientVitalsModel({
    this.heartRate,
    this.systolicBp,
    this.diastolicBp,
    this.spo2,
    this.respiratoryRate,
    this.temperatureC,
    this.consciousness = "ALERT",
  });

  Map<String, dynamic> toJson() => {
        'heart_rate': heartRate,
        'systolic_bp': systolicBp,
        'diastolic_bp': diastolicBp,
        'spo2': spo2,
        'respiratory_rate': respiratoryRate,
        'temperature_c': temperatureC,
        'consciousness': consciousness,
      };

  factory PatientVitalsModel.fromJson(Map<String, dynamic> json) {
    return PatientVitalsModel(
      heartRate: json['heart_rate'] as int?,
      systolicBp: json['systolic_bp'] as int?,
      diastolicBp: json['diastolic_bp'] as int?,
      spo2: json['spo2'] as int?,
      respiratoryRate: json['respiratory_rate'] as int?,
      temperatureC: (json['temperature_c'] as num?)?.toDouble(),
      consciousness: json['consciousness'] as String? ?? "ALERT",
    );
  }
}

class PatientEncounterModel {
  final String? id;
  final String submittedByName;
  final String submittedByPhone;
  final String patientName;
  final int age;
  final String gender;
  final String address;
  final double? heightCm;
  final double? weightKg;
  final String chiefComplaint;
  final List<String> symptoms;
  final String rawTranscript;
  final PatientVitalsModel vitals;
  final String? woundImageBase64;
  final String? createdAt;
  final bool syncedFromOffline;

  PatientEncounterModel({
    this.id,
    required this.submittedByName,
    required this.submittedByPhone,
    required this.patientName,
    required this.age,
    required this.gender,
    required this.address,
    this.heightCm,
    this.weightKg,
    required this.chiefComplaint,
    required this.symptoms,
    required this.rawTranscript,
    required this.vitals,
    this.woundImageBase64,
    this.createdAt,
    this.syncedFromOffline = true,
  });

  double? get bmi {
    if (heightCm != null && weightKg != null && heightCm! > 0) {
      final hm = heightCm! / 100.0;
      final val = weightKg! / (hm * hm);
      return double.parse(val.toStringAsFixed(1));
    }
    return null;
  }

  String get bmiCategory {
    final v = bmi;
    if (v == null) return "N/A";
    if (v < 18.5) return "Underweight";
    if (v < 25.0) return "Normal weight";
    if (v < 30.0) return "Overweight";
    return "Obese";
  }

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'submitted_by_name': submittedByName,
        'submitted_by_phone': submittedByPhone,
        'patient_name': patientName,
        'age': age,
        'gender': gender,
        'address': address,
        'height_cm': heightCm,
        'weight_kg': weightKg,
        'chief_complaint': chiefComplaint,
        'symptoms': symptoms,
        'raw_transcript': rawTranscript,
        'vitals': vitals.toJson(),
        'wound_image_base64': woundImageBase64,
        if (createdAt != null) 'created_at': createdAt,
        'synced_from_offline': syncedFromOffline,
      };

  factory PatientEncounterModel.fromJson(Map<String, dynamic> json) {
    return PatientEncounterModel(
      id: json['id'] as String?,
      submittedByName: json['submitted_by_name'] as String? ?? "Field Worker",
      submittedByPhone: json['submitted_by_phone'] as String? ?? "9876543210",
      patientName: json['patient_name'] as String? ?? "Anonymous",
      age: json['age'] as int? ?? 0,
      gender: json['gender'] as String? ?? "Other",
      address: json['address'] as String? ?? "Field Location",
      heightCm: (json['height_cm'] as num?)?.toDouble(),
      weightKg: (json['weight_kg'] as num?)?.toDouble(),
      chiefComplaint: json['chief_complaint'] as String? ?? "General Examination",
      symptoms: (json['symptoms'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      rawTranscript: json['raw_transcript'] as String? ?? "",
      vitals: json['vitals'] != null
          ? PatientVitalsModel.fromJson(json['vitals'] as Map<String, dynamic>)
          : PatientVitalsModel(),
      woundImageBase64: json['wound_image_base64'] as String?,
      createdAt: json['created_at'] as String?,
      syncedFromOffline: json['synced_from_offline'] as bool? ?? false,
    );
  }
}
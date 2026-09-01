import 'dart:typed_data';

import 'package:firebase_storage/firebase_storage.dart';

class FirebaseStorageService {
  FirebaseStorageService({FirebaseStorage? storage})
      : _storage = storage ?? FirebaseStorage.instance;

  final FirebaseStorage _storage;

  Reference ref(String path) => _storage.ref(path);

  Future<String> uploadBytes({
    required String path,
    required Uint8List bytes,
    String? contentType,
  }) async {
    final reference = _storage.ref(path);
    final metadata = contentType == null
        ? null
        : SettableMetadata(contentType: contentType);
    await reference.putData(bytes, metadata);
    return reference.getDownloadURL();
  }
}

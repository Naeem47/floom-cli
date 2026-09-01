import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  FirestoreService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> collection(String path) {
    return _firestore.collection(path);
  }

  DocumentReference<Map<String, dynamic>> doc(String path) {
    return _firestore.doc(path);
  }

  Future<Map<String, dynamic>?> getDocument(String path) async {
    final snapshot = await _firestore.doc(path).get();
    return snapshot.data();
  }

  Future<void> setDocument(
    String path,
    Map<String, dynamic> data, {
    bool merge = false,
  }) {
    return _firestore.doc(path).set(data, SetOptions(merge: merge));
  }
}

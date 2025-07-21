import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static String get _baseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:8888';
  
  // Make baseUrl publicly accessible
  static String get baseUrl => _baseUrl;

  static Future<Map<String, dynamic>> fetchProducts({
    int page = 1,
    int limit = 10,
    String? search,
    String? sort,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/products')
          .replace(queryParameters: {
            'page': page.toString(),
            'limit': limit.toString(),
            if (search != null && search.isNotEmpty) 'search': search,
            if (sort != null) 'sort': sort,
          });

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load products: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Failed to connect to the server: $e');
    }
  }
}
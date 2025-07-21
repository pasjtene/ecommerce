import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductsProvider with ChangeNotifier {
  List<Product> _products = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  int _totalPages = 1;
  int _totalItems = 0;
  bool _hasMore = true;

  List<Product> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get totalPages => _totalPages;
  int get totalItems => _totalItems;
  bool get hasMore => _hasMore;

  Future<void> loadProducts({
    String? search,
    String? sort,
    bool loadMore = false,
  }) async {
    if (_isLoading || (loadMore && !_hasMore)) return;
    try {
      _isLoading = true;
      if (!loadMore) notifyListeners();

      final data = await ApiService.fetchProducts(
        page: loadMore ? _currentPage + 1 : 1,
        search: search,
        sort: sort,
      );

      final newProducts = (data['products'] as List?)
          ?.map((productJson) => Product.fromJson(productJson))
          .toList() ?? [];

      if (loadMore && newProducts.isNotEmpty) {
        _products.addAll(newProducts);
        _currentPage++;
      } else {
        _products = newProducts;
        _currentPage = 1;
      }

      _totalPages = data['totalPages'] ?? 1;
      _totalItems = data['totalItems'] ?? 0;
      _hasMore = _currentPage < _totalPages;
      
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreProducts() async {
    if (_hasMore && !_isLoading) {
      await loadProducts(loadMore: true);
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
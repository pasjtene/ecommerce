import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/products_provider.dart';
import '../widgets/product_item.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  String _sortOption = 'id';
  bool _initialLoadComplete = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_scrollListener);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadInitialProducts());
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialProducts() async {
    await Provider.of<ProductsProvider>(context, listen: false).loadProducts();
    if (mounted) {
      setState(() => _initialLoadComplete = true);
    }
  }

  void _scrollListener() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      Provider.of<ProductsProvider>(context, listen: false).loadMoreProducts();
    }
  }

  Future<void> _refreshProducts() async {
    await Provider.of<ProductsProvider>(context, listen: false).loadProducts(
      search: _searchController.text,
      sort: _sortOption,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshProducts,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search products...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    onSubmitted: (_) => _refreshProducts(),
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _sortOption,
                  items: const [
                    DropdownMenuItem(
                      value: 'id',
                      child: Text('Default'),
                    ),
                    DropdownMenuItem(
                      value: 'price',
                      child: Text('Price ↑'),
                    ),
                    DropdownMenuItem(
                      value: '-price',
                      child: Text('Price ↓'),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() => _sortOption = value!);
                    _refreshProducts();
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: !_initialLoadComplete
                ? const Center(child: CircularProgressIndicator())
                : Consumer<ProductsProvider>(
                    builder: (context, provider, _) {
                      if (provider.error != null) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text('Error: ${provider.error}'),
                              const SizedBox(height: 10),
                              ElevatedButton(
                                onPressed: _refreshProducts,
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        );
                      }

                      if (provider.products.isEmpty) {
                        return const Center(child: Text('No products found'));
                      }

                      return RefreshIndicator(
                        onRefresh: _refreshProducts,
                        child: GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(8),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.7,
                            crossAxisSpacing: 8,
                            mainAxisSpacing: 8,
                          ),
                          itemCount: provider.products.length + (provider.hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index < provider.products.length) {
                              return ProductItem(product: provider.products[index]);
                            } else {
                              return provider.isLoading
                                  ? const Center(child: CircularProgressIndicator())
                                  : const SizedBox();
                            }
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
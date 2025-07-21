class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String slug;
  final List<String> imageUrls;
  final String? shopName;
  final int shopId;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.slug,
    required this.imageUrls,
    this.shopName,
    required this.shopId,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Handle potential null values with defaults
    final images = json['images'] as List<dynamic>? ?? [];
    
    return Product(
      id: json['ID'] ?? json['id'] ?? 0, // Handle both uppercase and lowercase
      name: json['name'] ?? 'No Name',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
      stock: json['stock'] ?? 0,
      slug: json['Slug'] ?? json['slug'] ?? '',
      imageUrls: images.map((image) => image['url'] as String? ?? '').toList(),
      shopName: json['shop']?['name'],
      shopId: json['ShopID'] ?? json['shop_id'] ?? 0,
    );
  }
}
import ProductDetail from "@/components/product/ProductDetail";

export default async function Product({ params }) {
    const { productId } = await params;

    // Here we would fetch real data from Firestore
    // For now, it uses the mock data in the component
    return <ProductDetail productId={productId} />;
}

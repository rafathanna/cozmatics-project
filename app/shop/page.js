import CategoryPage from "@/components/shop/CategoryPage";

export const metadata = {
    title: "Shop All Products",
    description: "Browse our complete collection of premium skincare, hair care, and body care products. Quality beauty essentials delivered to your door.",
};

export default function Shop() {
    return <CategoryPage categoryName="shop" />;
}

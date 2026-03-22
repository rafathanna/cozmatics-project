import CategoryPage from "@/components/shop/CategoryPage";

export async function generateMetadata({ params }) {
    const { categoryId } = await params;
    const name = categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/-/g, ' ');

    return {
        title: `${name} Collections`,
        description: `Explore our premium ${name} products. Scientifically proven formulas for your daily beauty routine at Cozmatics.`,
        openGraph: {
            title: `${name} | Cozmatics`,
            description: `Quality ${name} essentials for healthy, radiant skin and body.`,
        }
    };
}

export default async function Category({ params }) {
    const { categoryId } = await params;
    return <CategoryPage categoryName={categoryId} />;
}

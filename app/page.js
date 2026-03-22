import HeroSlider from "@/components/home/HeroSlider";
import CategoryBlocks from "@/components/home/CategoryBlocks";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Brands from "@/components/home/Brands";
import ShopByConcern from "@/components/home/ShopByConcern";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeWrapper}>
      <HeroSlider />

      <CategoryBlocks />
      <Brands />
      <FeaturedProducts />
      <ShopByConcern />

      {/* Newsletter is already in Footer */}
    </div>
  );
}

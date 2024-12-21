import styles from "./load.module.css";
import Zagruzka from "./zagruzka";

export default function Loading_page() {
  return (
    <div className={styles.container}>
      {[...Array(6)].map((_, index) => (
        <div className={styles.rain} key={index}>
          <div className={styles.drop}></div>
          <div className={styles.waves}>
            <div></div>
          </div>
          <div className={styles.splash}></div>
          <div className={styles.particles}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { PageLayout } from "@/components/layout/PageLayout";
import Imovi from "./Imovi";

const Home = () => {
  return (
    <PageLayout showTitle={false}>
      <Imovi />
    </PageLayout>
  );
};

export default Home;

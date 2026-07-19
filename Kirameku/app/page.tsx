import PersonalizedHome from "@/components/home/PersonalizedHome";
import { loadHomePageData } from "@/config/home";


export default async function Home() {
  const data = await loadHomePageData();
  return <PersonalizedHome data={data} />;
}

import { ArrowRight } from "lucide-react";
import Brand from "./Brand";

export default function PageHeader() {
  return <header className="site-header">
    <Brand />
    <a className="site-header-link" href="/studio">Teacher studio <ArrowRight size={16} /></a>
  </header>;
}

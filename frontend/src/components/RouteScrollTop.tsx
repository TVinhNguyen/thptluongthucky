import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteScrollTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};

export default RouteScrollTop;

import { useParams } from "react-router-dom";
import PostCategoryListPage from "@/pages/PostCategoryListPage";
import PhotoAlbumListPage from "@/pages/PhotoAlbumListPage";
import VideoListPage from "@/pages/VideoListPage";
import PhotoAlbumDetailPage from "./PhotoAlbumDetailPage";

const CategoryRoute = () => {
  const { category, slug } = useParams();

  if (category === "anh") {
    if (slug) return <PhotoAlbumDetailPage />;
    return <PhotoAlbumListPage />;
  }
  if (category === "video") return <VideoListPage />;
  return <PostCategoryListPage />;
};

export default CategoryRoute;
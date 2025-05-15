export class ListPostsDto {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    userId?: string;
    category?: string;
  };
}

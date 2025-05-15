export class ListCategoriesDto {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    name?: string;
  };
}

export class CreatePostDto {
  title: string;
  content: string;
  userId: number;
  categoryId?: number;
  tagId?: number;
}

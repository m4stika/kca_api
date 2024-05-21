type Paging = {
  totalRows: number;
  totalPages: number;
  rowPerPage: number;
  page: number;
  previous: number;
  next: number;
  hasMore: boolean;
};

type ApiResponse<T> =
  | {
      status: 'success';
      data: T;
      paging?: Paging;
    }
  | {
      status: 'error';
      errorType: 'error' | 'schema' | 'prisma' | 'multer' | 'unknown';
      message: string;
      issues?: T;
      tokenExpired: boolean;
    };

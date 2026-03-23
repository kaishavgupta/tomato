import DataURIParser from "datauri/parser";

interface UploadBody {
   fileBuffer: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UploadBody | null;
}

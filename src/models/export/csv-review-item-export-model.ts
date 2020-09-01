class CsvReviewItemExportModel {

  maxTags: number;
  rows: {
    reviewItem: string;
    type: string;
    tags: {
      tagText: string;
    }[]
  }[];
}
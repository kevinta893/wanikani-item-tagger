class CsvReviewItemExportModel {

  maxTags: number;
  rows: {
    reviewItem: string;
    type: string;
    dateCreated: string;
    lastUpdated: string;
    tags: {
      tagText: string;
    }[]
  }[];
}
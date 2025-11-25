export interface carousel_items {
  id: string;
  type: string;
  imageUrl: string;
  link: string;
  thumbnailUrl: string;
}

export interface home_images {
  id: string;
  image: string;
  url: string;
}

export interface forum {
  id: number;
  title: string;
  userId: string;
  description: string;
  createdAt: string;
}

export interface learn {
  id: string;
  thumbnail: string;
  name: string;
}

export interface quizes {
  id: string;
  name: string;
  thumbail: string;
  use: boolean;
}

export interface quiz_questions {
  id: string;
  quiz: string;
  question: string;
  correctOptionIndex: number;
  options: Array<string>;
  category: string;
}

export interface videos {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
}

export const schemas = {
  carousel_items: {
    type: String,
    imageUrl: String,
    link: String,
    thumbnailUrl: String,
  },
  home_images: {
    image: String,
    url: String,
  },
  forum: {
    title: String,
    userId: String,
    description: String,
    createdAt: String,
  },
  learn: {
    thumbnail: String,
    name: String,
  },
  quizes: {
    name: String,
    thumbail: String,
    use: Boolean,
  },
  quiz_questions: {
    quiz: String,
    question: String,
    correctOptionIndex: Number,
    options: Array,
    category: String,
  },
  videos: {
    title: String,
    thumbnailUrl: String,
    videoUrl: String,
    category: String,
  },
};

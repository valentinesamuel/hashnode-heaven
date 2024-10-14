type NotionUser = {
  object: 'user';
  id: string;
};

type NotionIcon = {
  type: string;
  emoji: string;
};

type NotionParent = {
  type: 'database_id';
  database_id: string;
};

type NotionDate = {
  start: string;
  end: string | null;
  time_zone: string | null;
};

type NotionStatus = {
  id: string;
  name: string;
  color: string;
};

type NotionProperty<T> = {
  id: string;
  type: string;
} & {
  [key: string]: T;
};

type NotionText = {
  type: string;
  text: {
    content: string;
    link: string | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
};

type NotionPage = {
  object: string;
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  cover: null;
  icon: NotionIcon | null;
  parent: NotionParent;
  archived: boolean;
  in_trash: boolean;
  properties: {
    'Due date': NotionProperty<{ date: NotionDate | null }>;
    Status: NotionProperty<{ status: NotionStatus }>;
    Title: NotionProperty<{ title: NotionText[] }>;
  };
  url: string;
  public_url: string;
};

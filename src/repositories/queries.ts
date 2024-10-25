export const PUBLISH_POST = `
  mutation PublistPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
           info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
        readTimeInMinutes
    }
  }
}
`;

export const GET_POST = `
query getPost($id: ID!) {
  post(id: $id) {
        id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
           info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
  }
}
`;

export const UPDATE_POST = `
mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
         id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
           info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
      }
    }
  }
`;

export const DELETE_POST = `
mutation removePost($input: RemovePostInput!) {
  removePost(input: $input) {
    post {
      id
      slug
      title
      subtitle
      tags {
        id
        name
        slug
        logo
        tagline
        followersCount
        postsCount
        info {
          markdown
        }
      }
      url
      canonicalUrl
      coverImage {
        url
        isPortrait
      }
      brief
      content {
        markdown
      }
      publishedAt
      updatedAt
      featured
      publishedAt
      updatedAt
    }
  }
}`;

export const RESTORE_POST = `
mutation RestorePost($input: RestorePostInput!) {
    restorePost(input: $input) {
      post {
        id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
           info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
      }
    }
  }
`;

export const CREATE_DRAFT_POST = `
mutation CreateDraft($input: CreateDraftInput!) {
  createDraft(input: $input) {
    draft {
      id
      slug
      title
      subtitle
      tagsV2 {
        __typename
      }
      coverImage {
        url
        attribution
      }
      updatedAt
      lastBackup {
        status
        at
      }
      lastFailedBackupAt
      lastSuccessfulBackupAt
      scheduledDate
      publishedPost {
        id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
          info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
      }
    }
  }
}
`
export const PUBLISH_DRAFT_POST = `
mutation PublishDraft($input: PublishDraftInput!) {
    publishDraft(input: $input) {
      post {
        id
        slug
        title
        subtitle
        tags {
          id
          name
          slug
          logo
          tagline
          followersCount
          postsCount
           info {
            markdown
          }
        }
        url
        canonicalUrl
        coverImage {
          url
          isPortrait
        }
        brief
        content {
          markdown
        }
        publishedAt
        updatedAt
        featured
        publishedAt
        updatedAt
      }
    }
  }
`  
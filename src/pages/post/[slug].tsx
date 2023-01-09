import { useState, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import {
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const [readingTime, setReadingTime] = useState<number>();

  useEffect(() => {
    const totalWords = post.data.content.reduce((sum, item) => {
      const wordCountHeading = item.heading.split(/\w/).length;
      const wordCountBody = RichText.asText(item.body).split(/\w/).length;
      return sum + wordCountHeading + wordCountBody;
    }, 0);
    setReadingTime(Math.ceil(totalWords / 200));
  }, [post]);

  return (
    <>
      <main className={styles.container}>
        <Header />
        <section className={styles.postBanner}>
          <img src={post.data.banner.url} alt="banner" />
        </section>
        <section className={styles.postHeader}>
          <div className={styles.postTitle}>{post.data.title}</div>
          <div className={styles.postInfo}>
            <span className={commonStyles.publicationDate}>
              <AiOutlineCalendar />
              {post.first_publication_date}
            </span>
            <span className={commonStyles.author}>
              <AiOutlineUser />
              {post.data.author}
            </span>
            <span className={commonStyles.timeAvailable}>
              <AiOutlineClockCircle />
              {readingTime} min
            </span>
          </div>
        </section>
        <section className={styles.postContent}>
          {post.data.content.map(content => (
            <article>
              <div className={styles.contentHeading}>{content.heading}</div>
              <div
                className={styles.contentBody}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  const paths = postsResponse.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
    // true: se ainda não foi gerado, abre a tela sem conteúdo, faz a requisição e espera montar a tela
    // false: se o post não foi gerado de forma estática ainda, retorna 404, usado quando você já gerou tudo
    // blocking: se ainda não foi gerado, carrega usando o server-side rendering, e só mostra a tela quando estiver completo
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  // console.log(JSON.stringify(response, null, 2));

  const post = {
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: { post },
  };
};

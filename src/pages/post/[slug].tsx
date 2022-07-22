import { GetStaticPaths, GetStaticProps } from 'next';

import {
  AiOutlineCalendar,
  AiOutlineUser,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  return (
    <>
      <main className="container">
        <header className="headerTitle">
          <img src="/images/spacetraveling.svg" alt="logo" />
        </header>
        <body>
          <img src={post.data.banner.url} alt="banner" />
          <div>
            <span className="title">{post.data.title}</span>
            <span className="publicationDate">
              <AiOutlineCalendar />
              {post.first_publication_date}
            </span>
            <span className="author">
              <AiOutlineUser />
              {post.data.author}
            </span>
            <span className="timeAvailable">
              <AiOutlineClockCircle />
              {post.first_publication_date}
            </span>
          </div>
        </body>
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

  console.log(JSON.stringify(response, null, 2));

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
          body: [],
        };
      }),
    },
  };

  return {
    props: { post },
  };
};

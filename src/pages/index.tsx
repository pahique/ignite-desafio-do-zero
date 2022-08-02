import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(
    postsPagination.next_page !== null
  );

  const handleLoadMoreClick = (): void => {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const modifiedPosts = [...posts];
        modifiedPosts.push(...data.results);
        setPosts(modifiedPosts);
        setHasMorePosts(data.next_page !== null);
      });
  };

  return (
    <>
      <main className="container">
        <Header />
        <section className="posts">
          {posts.map(post => (
            <article key={post.uid}>
              <h1>
                <Link href={`/post/${post.uid}`}>{post.data.title}</Link>
              </h1>
              <h2>{post.data.subtitle}</h2>
              <div className="publicationDate">
                <AiOutlineCalendar />
                {post.first_publication_date}
              </div>
              <div className="author">
                <AiOutlineUser />
                {post.data.author}
              </div>
            </article>
          ))}
          {hasMorePosts && (
            <button
              type="button"
              onClick={handleLoadMoreClick}
              className="button-highlight"
            >
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 2 });

  console.log(JSON.stringify(postsResponse, null, 2));

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'PP',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    } as Post;
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      } as PostPagination,
    },
  };
};

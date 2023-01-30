import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';

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

export default function Home({ postsPagination }: HomeProps) {
  
  const [props, setProps] = useState<PostPagination>(postsPagination);
  async function nextPage() {
    fetch(props.next_page)
      .then((response) => response.json())
      .then((data) => {
        const newPost: Post = {
          uid: data.results[0].uid,
          first_publication_date: data.results[0].first_publication_date,
          data: {
            title: data.results[0].data.title,
            subtitle: data.results[0].data.subtitle,
            author: data.results[0].data.author,
          },
        };
        const state = props.results;
        state.push(newPost);

        const newProps: PostPagination = {
          next_page: data?.next_page || null,
          results: state,
        };
        setProps(newProps);
      });
  }
  
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        {/* <div className={styles.loading}>Carregando...</div> */}
        <div className={styles.containerLogo}>
          <img src="/images/Logo.svg" alt="logo" />
        </div>
        {props?.results.map((post: Post) => {
          return (
            <article key={post.uid} className={styles.post}>
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <h1>{post?.data.title}</h1>
                </a>
              </Link>
              <p className={styles.subtitle}>{post?.data.subtitle}</p>
              <div className={styles.info}>
                <p>
                  <FiCalendar className={styles.icon} />
                  
                    {format(
                      new Date(post?.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  
                </p>
                <p>
                  <FiUser className={styles.icon} />
                  {post?.data.author}
                </p>
              </div>
            </article>
          );
        })}
        {props.next_page && (
          <button
            type="button"
            className={styles.loadingPost}
            onClick={() => nextPage()}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    page: 1,
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: response,
    },
  };
};

import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { useEffect, useState } from 'react';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';

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

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  const [leitura, setLeitura] = useState<number>(0);
  useEffect(() => {
    let qtdPalavra = 0;
    post?.data.content.forEach((value) => {
      qtdPalavra += RichText.asText(value.body).toString().split(' ').length;
    });
    setLeitura(Math.ceil(qtdPalavra / 200));
  }, [post]);

  if (isFallback || !post) <p>Carregando...</p>;


  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post?.data.banner.url} alt="" />
      </div>
      <main className={styles.contentContainer}>
        <p style={{color:"transparent"}}>Carregando...</p>
        <h1 className={styles.title}>{post?.data?.title}</h1>
        <div className={styles.info}>
          <p>
            <FiCalendar className={styles.icon} />

            {post&&format(new Date((post?.first_publication_date)), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </p>
          <p>
            <FiUser className={styles.icon} />
            {post?.data.author}
          </p>
          <p>
            <FiClock className={styles.icon} />
            {`${leitura} min`}
          </p>
        </div>
        <article className={styles.containerArticle}>
          {post?.data.content.map((item) => {
            return (
              <section key={item.heading}>
                <h1 className={styles.heading}>{item.heading}</h1>
                <div
                  className={`${styles.postContent}`}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asText(item.body).toString(),
                  }}
                />
              </section>
            );
          })}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', {
    fetch: ['post.slogs'],
    page: 1,
    pageSize: 20,
  });

  const paths = response.results.map((it) => ({ params: { slug: it.uid } }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID<any>('post', String(slug), {});
  
  return {
    props: {
      post: response,
    },
    redirect: 60 * 30, //30 minutos
  };
};

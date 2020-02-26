import { ApolloClient, HttpLink, from, InMemoryCache, gql, fromError } from '@apollo/client';
import { onError } from '@apollo/link-error';

import fetch from 'isomorphic-unfetch';

const httpLink = new HttpLink({
  uri: 'https://graphql-compose.herokuapp.com/northwind',
  fetch,
});

const errorCatch = onError((params) => {
  console.log(params);
});

const apolloClient = new ApolloClient({
  link: errorCatch.concat(from([httpLink])),
  cache: new InMemoryCache({}).restore({}),
});

if (typeof window !== 'undefined') {
  (window as any).ac = apolloClient;
}
apolloClient
  .query({
    query: gql`
      query TestQuery {
        viewer {
          orderPagination {
            count
            items {
              orderID
              orderDate
              employee {
                firstName
                lastName
                _id
              }
            }
          }
        }
      }
    `,
  })
  .then((res) => console.log(res));

function IndexPage() {
  return (
    <div>
      <div>
        <div className="row">
          <div className="col-sm-12">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1>Northwind data explorer via GraphQL</h1>
            </div>
            <p>
              This is a true story. The events depicted took place in <b>Northwind company</b> in{' '}
              <b>1996-1998</b>. At the request of the survivors, the names have been changed. Out of
              respect for the dead, the rest has been told exactly as it occurred.
            </p>
            <p style={{ textAlign: 'right', fontWeight: 'bold' }}>© Fargo</p>
          </div>
        </div>
      </div>

      <div>
        <h4>Source code of server-side</h4>
        <a
          href="https://github.com/graphql-compose/graphql-compose-examples/tree/master/examples/northwind"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/graphql-compose/graphql-compose-examples/tree/master/examples/northwind
        </a>
      </div>

      <div style={{ marginTop: 50 }}>
        <h4> NOTICE</h4>
        <code>__generated__</code> folders should be added to <code>.gitignore</code> file.
        It&apos;s bad to keep generated files in repo because it complicates code review. You need
        to generate files everytime before you build or start app in watch mode. In this repo I keep
        generated files only for demo purposes!
      </div>
    </div>
  );
}

export default IndexPage;

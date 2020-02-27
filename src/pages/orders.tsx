import React, { useState } from 'react';
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
} from '@apollo/client';
import { Table, Button, notification } from 'antd';
import fetch from 'isomorphic-unfetch';

const httpLink = new HttpLink({
  uri: 'https://graphql-compose.herokuapp.com/northwind',
  fetch,
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({}).restore({}),
});

if (typeof window !== 'undefined') {
  (window as any).ac = apolloClient;
}

// переменные можно установить в параметре запроса или в строке (page: ${variables.page})
// запрос в graphql ($perPage)
const query = gql`
  query OrderListQuery($perPage: Int!, $page: Int!) {
    viewer {
      orderPagination(perPage: $perPage, page: $page) {
        count
        items {
          orderID
          orderDate
          employee {
            firstName
            lastName
          }
        }
        pageInfo {
          perPage
          currentPage
        }
      }
    }
  }
`;

// удаление поля
const orderDelete = gql`
  mutation OrderDeleteMutation($filter: FilterRemoveOneOrderInput!) {
    removeOrder(filter: $filter) {
      record {
        orderID
      }
    }
  }
`;

const TestQuery = () => {
  // удаление поля из таблицы
  const [deleteOrder] = useMutation(orderDelete);
  const [pageState, setPageState] = useState({
    page: 1,
    perPage: 6,
  });

  // отправка запроса в graph ql
  const { data, loading, refetch, error } = useQuery(query, {
    variables: {
      perPage: pageState.perPage,
      page: pageState.page,
    },
    onCompleted: () => {
      notification.info({
        message: 'Запрос выполнен!!!',
      });
    },
    onError: (e) => {
      notification.error({
        message: JSON.stringify(e),
      });
    },
  });

  const onChange = (paginator) => {
    setPageState({
      page: paginator.current,
      perPage: paginator.pageSize,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>${JSON.stringify(error)}</div>;
  } else if (data) {
    //console.log(data);
    // full name - кастомный рендер в таблице
    // employee - слодный путь во вложенном объект

    return (
      <Table
        loading={loading}
        dataSource={data?.viewer?.orderPagination?.items || []}
        pagination={{
          pageSize: data?.viewer?.orderPagination?.pageInfo?.perPage || 10,
          current: data?.viewer?.orderPagination?.pageInfo?.currentPage || 1,
          total: data?.viewer?.orderPagination?.count || 0,
          showSizeChanger: true,
        }}
        onChange={onChange}
        rowKey="orderID"
        rowClassName={() => 'editable-row'}
        columns={[
          {
            title: 'OrderID',
            dataIndex: 'orderID',
          },
          {
            title: 'Order date',
            dataIndex: 'orderDate',
          },
          {
            title: 'employee',
            dataIndex: 'employee.firstName',
          },
          {
            title: 'Full name',
            render: (record) => (
              <span>{`${record.employee.firstName} ${record.employee.lastName}`}</span>
            ),
          },
          {
            title: 'Delete',
            render: (record) => {
              return (
                <Button
                  onClick={async () => {
                    await deleteOrder({
                      variables: {
                        filter: {
                          orderID: record.orderID,
                        },
                      },
                    });
                    refetch();
                    notification.error({
                      message: 'Запись удалена',
                    });
                  }}
                >
                  Delete
                </Button>
              );
            },
          },
        ]}
      />
    );
  }
};

const OrdersPage = () => (
  <ApolloProvider client={apolloClient}>
    <TestQuery />
  </ApolloProvider>
);

export default OrdersPage;

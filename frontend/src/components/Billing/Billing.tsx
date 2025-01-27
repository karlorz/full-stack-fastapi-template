import { Badge, Box, Container, Flex, Table, Text } from "@chakra-ui/react"
import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { FaFileDownload } from "react-icons/fa"

import CustomCard from "../Common/CustomCard"
import { Skeleton } from "../ui/skeleton"
import { billings } from "./Billings"
import CurrentPlan from "./CurrentPlan"
import PaymentMethod from "./PaymentMethod"

function BillingTableBody() {
  return (
    <Table.Body>
      {billings.map(({ id, invoice, amount, date, status }) => {
        const data = [
          invoice,
          amount,
          date,
          <Badge key={status} colorScheme={status === "Paid" ? "green" : "red"}>
            {status}
          </Badge>,
          <FaFileDownload key="download" cursor="pointer" />,
        ]

        return (
          <Table.Root key={id} interactive>
            {data.map((item, index) => (
              <Table.Cell key={index}>{item}</Table.Cell>
            ))}
          </Table.Root>
        )
      })}
    </Table.Body>
  )
}

function BillingTable() {
  const headers = ["Invoice", "Amount", "Date", "Status", "Actions"]

  return (
    <Table.Root size={{ base: "sm", md: "md" }} variant="outline">
      <Table.Header>
        <Table.Row>
          {headers.map((header) => (
            <Table.ColumnHeader
              key={header}
              style={{ textTransform: "capitalize" }}
            >
              {header}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={4}>
                Something went wrong: {error.message}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        )}
      >
        <Suspense
          fallback={
            <Table.Body>
              {new Array(5).fill(null).map((_, index) => (
                <Table.Row key={index}>
                  <Table.Cell colSpan={5}>
                    <Box width="100%">
                      <Skeleton height="20px" />
                    </Box>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          }
        >
          <BillingTableBody />
        </Suspense>
      </ErrorBoundary>
    </Table.Root>
  )
}

const Billing = () => {
  return (
    <Container maxW="full" my={4} p={0}>
      <CustomCard title="Billing Email">
        <Text>team1@domain.com</Text>
      </CustomCard>
      <CustomCard title="Current Plan">
        <Flex p={4} flexDir={{ base: "column", md: "row" }} gap={4}>
          <CurrentPlan />
          <PaymentMethod />
        </Flex>
      </CustomCard>
      <CustomCard title="Invoice History">
        <BillingTable />
      </CustomCard>
    </Container>
  )
}

export default Billing

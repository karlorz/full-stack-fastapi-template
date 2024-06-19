import {
  Badge,
  Box,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { FaFileDownload } from "react-icons/fa"

import CurrentPlan from "../Billing/CurrentPlan"
import PaymentMethod from "../Billing/PaymentMethod"
import { billings } from "./Billings"

function BillingTableBody() {
  return (
    <Tbody>
      {billings.map(({ id, invoice, amount, date, status }) => {
        const data = [
          invoice,
          amount,
          date,
          <Badge colorScheme={status === "Paid" ? "green" : "red"}>
            {status}
          </Badge>,
          <FaFileDownload cursor="pointer" />,
        ]

        return (
          <Tr key={id}>
            {data.map((item, index) => (
              <Td key={index}>{item}</Td>
            ))}
          </Tr>
        )
      })}
    </Tbody>
  )
}

function BillingTable() {
  const headers = ["Invoice", "Amount", "Date", "Status", "Actions"]

  return (
    <TableContainer py={6}>
      <Table size={{ base: "sm", md: "md" }} variant="unstyled">
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th key={header} style={{ textTransform: "capitalize" }}>
                {header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={4}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    <Td colSpan={5}>
                      <Box width="100%">
                        <Skeleton height="20px" />
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <BillingTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

const Billing = () => {
  return (
    <Container maxW="full" m={4}>
      <Heading size="sm">Billing Information</Heading>
      <Text py={2} mb={4}>
        See information regarding your current plan.
      </Text>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <FormControl id="email">
            <FormLabel fontWeight="bold">Billing Email</FormLabel>
            <Text>team1@domain.com</Text>
          </FormControl>
        </Box>
      </Box>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <Text fontWeight="bold">Current Plan</Text>
          <Flex pt={4}>
            <CurrentPlan />
            <PaymentMethod />
          </Flex>
        </Box>
      </Box>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <Text fontWeight="bold" pt={4}>
            Invoice History
          </Text>
          <BillingTable />
        </Box>
      </Box>
    </Container>
  )
}

export default Billing

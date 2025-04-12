
"use client";

import { useState } from "react";
import { ApiData } from "@/services/api-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sampleData: ApiData[] = [
  {
    id: 1,
    name: "Item 1",
    value: 10,
  },
  {
    id: 2,
    name: "Item 2",
    value: 20,
  },
];

export default function Home() {
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [data, setData] = useState<ApiData[]>(sampleData);

  const fetchData = async () => {
    // Placeholder for actual API call
    // const result = await fetch(apiEndpoint);
    // const jsonData = await result.json();
    // setData(jsonData);
    console.log("Fetching data from:", apiEndpoint);
    setData(sampleData);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">API Data View</h1>

      {/* API Endpoint Input */}
      <div className="mb-5 flex space-x-2">
        <Input
          type="url"
          placeholder="Enter API Endpoint"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
        />
        <Button onClick={fetchData}>Fetch Data</Button>
      </div>

      {/* Data Display (Table) */}
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your API data.</TableCaption>
          <TableHeader>
            <TableRow>
              {Object.keys(data[0] || {}).map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{String(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

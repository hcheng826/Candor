import styled from "@emotion/styled";
import React from "react";
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const data = [
  { name: "You", value: 90, color: "#F32871" },
  { name: "Others", value: 10, color: "#ababab" },
  //   { name: "Group E", value: 278 },
  //   { name: "Group F", value: 189 },
];

const StyledContainer = styled.div`
  width: 200px;
  height: 150px;
`;

export default function AllocatedFundChart() {
  return (
    <StyledContainer>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={200} height={200}>
          <Pie
            dataKey="value"
            isAnimationActive={true}
            data={data}
            outerRadius={48}
            fill="#F32871"
            label={(data) => data.payload.value + "%"}
          >
            <LabelList
              dataKey="name"
              position="right"
              style={{ fontSize: "14px" }}
            />
            {data.map((entry, index) => (
              <Cell fill={entry.color} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </StyledContainer>
  );
}

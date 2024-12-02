"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const Pagination = ({ finalPage }: any) => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") ?? "1");

  return (
    <div>
      {page > 1 ? (
        <Link href={`?page=${page - 1}`} prefetch={false}>
          Prev
        </Link>
      ) : (
        <span>Prev</span>
      )}{" "}
      |{" "}
      {page < finalPage ? (
        <Link href={`?page=${page + 1}`} prefetch={false}>
          Next
        </Link>
      ) : (
        <span>Next</span>
      )}
    </div>
  );
};

export default Pagination;

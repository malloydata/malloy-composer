/*
 * Copyright 2022 Google LLC
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { useEffect, useState } from "react";

type SearchParamsObject = {
  [k: string]: string;
};

interface UseQueryResult {
  params: SearchParamsObject;
  setParam: (param: string, value: string, replace?: boolean) => void;
  unsetParam: (param: string, replace?: boolean) => void;
}

function parse(searchString: string) {
  const urlSearchParams = new URLSearchParams(searchString);
  return Object.fromEntries(urlSearchParams.entries());
}

export function useQueryParams(): UseQueryResult {
  const [searchString, setSearchString] = useState(window.location.search);
  const [params, setParams] = useState(parse(searchString));

  useEffect(() => {
    const handler = () => {
      if (window.location.search !== searchString) {
        console.log(parse(window.location.search));
        setSearchString(window.location.search);
        setParams(parse(window.location.search));
      }
      console.log("Checking search string....");
    };

    window.addEventListener("popstate", handler);

    return () => window.removeEventListener("popstate", handler);
  }, []);

  const setParam = (param: string, value: string, replace = false) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (urlSearchParams.get(param) === value) return;
    urlSearchParams.set(param, value);
    setSearchString(urlSearchParams.toString());
    const newPath = window.location.pathname + "?" + urlSearchParams.toString();
    console.log("newPath", newPath);
    if (replace) {
      history.replaceState(null, "", newPath);
    } else {
      history.pushState(null, "", newPath);
    }
    setParams(parse(window.location.search));
  };

  const unsetParam = (param: string, replace = false) => {
    console.log("Unsetting", param);
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.delete(param);
    setSearchString(urlSearchParams.toString());
    const newPath = window.location.pathname + "?" + urlSearchParams.toString();
    console.log("newPathadf", newPath);
    if (replace) {
      history.replaceState(null, "", newPath);
    } else {
      history.pushState(null, "", newPath);
    }
    setParams(parse(window.location.search));
  };

  return { params, setParam, unsetParam };
}

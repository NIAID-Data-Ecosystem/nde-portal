import React from 'react';

import { useCallback } from "react";
import { scroller } from "react-scroll";

const Sidebar = ({ sourceData }) => {
  const date = useCallback((data) => {
    let dateString;
    dateString = new Date(data);
    return dateString.toDateString();
  }, []);

  const sourceNames = []
  for (const source in sourceData.src) {
    sourceNames.push([sourceData.src[source].sourceInfo.name, source])
  }
  sourceNames.sort((a, b) => a[0].localeCompare(b[0]))


  function handleNav(version) {
    scroller.scrollTo(`version${version}`, {
      duration: 1000,
      delay: 0,
      smooth: "easeInOutQuart",
      offset: -5,
    })
  };

  return (
    <>
      {sourceNames
        .map((name, index) => {
          return (
            <li key={index} className={"border-none m-2 ml-4 pb-4"}>
              <a
                className={"flex flex-col items-left h-14  cursor-pointer "}
                onClick={() => handleNav(name[0])}
              >
                <div className="text-gray-900 text-xl font-bold  ">
                  {name[0]} <br />
                </div>
                <div className="text-sm font-medium text-gray-500">
                  Latest Release {date(sourceData.src[name[1]].version)}
                </div>
              </a>
            </li>
          );
        })
      }
    </>
  )
};

export default Sidebar;

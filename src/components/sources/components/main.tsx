import React from 'react';

import { useCallback } from 'react';
import { setDateCreated } from '../../utils/setFunctions';
import { useState, useEffect } from 'react'
import './sourcesmain.css'

const Main = ({ sourceData }) => {

  const [sourcesArray, setSourcesArray] = useState([])
  const [schemaId, setSchemaId] = useState([])
  const [schemaText, setSchemaText] = useState([])

  function schemaIdFunc(e) {
    if (schemaId.includes(e.target.id) || schemaText.includes(e.target.id)) {
      setSchemaText(schemaText.filter(schemaText => schemaText !== e.target.id));
      return setSchemaId(schemaId.filter(schemaId => schemaId !== e.target.id));
    };
    setSchemaText([...schemaText, e.target.id]);
    return setSchemaId([...schemaId, e.target.id]);
  }

  useEffect(() => {
    async function buildSourceDetails() {
      const objArray = [];
      for (const source in sourceData.src) {
        const sourceDetails = {
          "name": sourceData.src[source].sourceInfo.name,
          "description": sourceData.src[source].sourceInfo.description,
          "dateCreated": await setDateCreated(sourceData.src[source].code.file),
          "dateModified": sourceData.src[source].version,
          "numberOfRecords": sourceData.src[source].stats[source],
          "schema": sourceData.src[source].sourceInfo.schema,
        };
        objArray.push(sourceDetails);
      };
      objArray.sort((a, b) => a.name.localeCompare(b.name));
      setSourcesArray(objArray);
    };
    buildSourceDetails();
  }, []);

  const date = useCallback((data) => {
    let dateString;
    dateString = new Date(data);
    return dateString.toDateString();
  }, []);


  return (
    <div className='mb-10'>

      <div
        className="tab-content tab-space md:w-5/6 divide-y divide-light-blue-400 border-b-2"
        key={'key'}
      >
        <div
          className={
            `text-gray-900 text-2xl p-2 mt-14 w-50 my-4 md:ml-8 font-bold `
          }
        >
          Version 1.0.0 Data Sources
        </div>

      </div>

      {sourcesArray.map((sourceObj, index) => {
        return (
          <div key={index} className={"tab-content pb-5 rounded-md border-2 border-niaid-blue/20 shadow-gray-400 shadow-sm m-2 tab-space md:w-5/6 divide-y divide-light-blue-400"}>
            <div>
              <section
                className="flex flex-col"
                id={`version${sourceObj.name}`}
              >
                <div
                  className={`bg-niaid-blue h-auto leading-8 ml-2 md:ml-5 text-left font-bold shadow-lg mt-10 mb-3 text-white w-96 mr-2 rounded-md`}
                >
                  <span className="ml-4">{sourceObj.name}</span>
                </div>
                <div className=" md:ml-14 font-bold text-gray-900">
                  {sourceObj.numberOfRecords.toLocaleString()} Records Available
                </div>
                <div className='md:ml-20 md:mr-20 ml-2 mr-2'>
                  <div
                    className="text-left mt-4 text-justify text-gray-900"
                    dangerouslySetInnerHTML={{
                      __html: sourceObj.description,
                    }}
                  ></div>

                  <div className='mt-2 font-bold text-gray-900 hidden sm:block'>
                    <p> Visualization of {sourceObj.name} properties transformed to the NIAID Data Ecosystem</p>
                    {schemaText.includes(sourceObj.name) &&
                      <button id={sourceObj.name} className='bg-niaid-green-500 transition duration-300 hover:bg-niaid-green-600 text-white font-bold py-0 px-4 rounded mt-1 w-36' onClick={(e) => schemaIdFunc(e)}>Hide Schema</button>
                      ||
                      <button id={sourceObj.name} className='bg-niaid-green-500 transition duration-300 hover:bg-niaid-green-600 text-white font-bold py-0 px-4 rounded mt-1 w-36' onClick={(e) => schemaIdFunc(e)}>Show Schema</button>
                    }
                    {schemaId.includes(sourceObj.name) &&
                      <div className='mt-4 transition-fade max-w-2xl relative overflow-x-auto shadow-md sm:rounded-lg'>
                        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                {sourceObj.name} Property
                              </th>
                              <th scope="col" className="px-6 py-3">
                                NIAID Data Ecosystem Property
                              </th>
                            </tr>
                          </thead>

                          <tbody className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
                            {Object.entries(sourceObj.schema).map((item) => {
                              return (
                                <tr key={item} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'>
                                  {Object.entries(item).map((field) => {
                                    return <td
                                      key={field} className='px-6 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap'>{field[1]}</td>
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    }
                  </div>
                  <div className='mt-4 '>
                    <div className="  font-bold text-gray-900">
                      Latest Release {date(sourceObj.dateModified)}
                    </div>
                    <div className="  font-bold text-gray-900">
                      First Released {date(sourceObj.dateCreated)}
                    </div>
                  </div>
                </div>
                <div className='text-center mt-2 mb-1  outline-none bg-transprent  text-white uppercase focus:outline-none cursor-pointer px-4 py-2 font-bold text-xs rounded-md shadow-sm ring-1 ring-slate-900/5 bg-niaid-green-500  dark:border-niaid-green-500  hover:bg-niaid-green-600 hover:text-white  transition duration-300 ml-20 mr-20 md:ml-20 md:mr-20 lg:w-2/5' >
                  <a href='/?' target='_blank' className=' '>Search {sourceObj.name} records</a>
                </div>
              </section>
            </div>
          </div>
        );
      })}

    </div >

  )
};

export default Main;

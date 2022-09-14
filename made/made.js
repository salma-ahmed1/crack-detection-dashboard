// const kvArray = [
//     { key: 1, value: 10 },
//     { key: 2, value: 20 },
//     { key: 3, value: 30 },
//   ];
  
//   const reformattedArray = kvArray.map(({ value}) => ({ [value]: value*2 }));

//   console.log(reformattedArray)
//   ///////////////////////////////////////////////////
//   var dataArr = []
//   for(i = 0; i < 8; i++)
//   {
//     dataArr[i] = {
//         type : dataArr.typeOfData,
//         series : []
//     }

//     for(y = 0; y < dataArr.length; y++)
//     {
//       series[i] = {
//         Road : data.name,
//         value : 0
//       }
//       series.value.map(count)
//     }
//   }
// //-----------------
// function count(crackType,RoadName)
// {
//   let count = 0
//   while(data.length)
//   {
//     if(crackType == data.typeOfData && RoadName == data.name)
//     {
//       count = count + 1
//     }
//   }
//   return count
// }
//---------------

///////////////////////////////////////////////////////////////////////////////////////////////////////////
  const dataArr=[];
    for(i = 0, i < 8, i++)
    {
        arr[i] = {

            name: data.typeOfData,
            series: []
        }
    };
  creatingObject(arr=[],count)
  {
    for(i = 0, i < count, i++)
    {
        arr[i] = {
            nameOfRoad: data.name,
            value: 0
        }
    }
  };
    series.value.map((count(series,data.length,name,nameOfRoad))) ;
    
    count(arr=[],name,crack)
    {
        counter = 0;
        if(nameOfRoad = data.name && name=data.typeofdata)
        {
            counter+=1
        };
        return counter;     
    }
   //////////////////////////////////////////////////////////////////////////////////////////

   // grouped = {};
        // let h = ["D1","D2"];
        //  let j= h.map(a=>{
        //     v:a
        //     result.features.map(f=>{
        //       name : f.attributes[h].nameOfRoad
        //     })
        //   })

        //ktabat s3eidy lel map
        //---------------
        // let v =[];
          //  Object.values(grouped).forEach(g=>{
          //    Object.values(g).map((b) => {
          //      v.push({
          //       name: Object.keys(g),
          //       roadType:b[0].TypeOfData,
          //       value: b.length,
          //      })
          //     });
          //   })
            // console.log(v);






            

            // let roadArr = [[]]

// // for(i = 0; i < grouped.length; i++) //looping in grouped arr in first index
// // {
// //   for(y = 0; y < grouped[i][1].length; y++)
// //   {
// //     for(let k in grouped[i][1])
// //   {
// //     roadArr[i][y] = k; 
// //   }
// //   }
  
// }
///////////////////////////////////////////////////////////////////////////////////////


// function setStackedChartData(grouped) {
//   //loop for gettng road names in each crack type
//    for(i = 0; i < grouped.length; i++) //looping in grouped arr in first index
//    {
//         for(y = 0; y < Object.keys(grouped[i][1]).length;y++)
//         {
//           roadArr[i][y] = Object.keys(grouped[i][1])[y]
//         }
//         // console.log("road array index: ",i," is roads of craks type:",grouped[i][0]," are: ",roadArr[i])
//   }
  
//   //loop for gettng value of eacj crack type in each road 
//   for(i = 0; i < grouped.length; i++) //looping in grouped arr in first index
//   {
//        for(y = 0; y < Object.keys(grouped[i][1]).length;y++)
//        {
//          arrValues[i][y] = grouped[i][1][roadArr[i][y]].length
//        }
//   }
//   //getting all road names in array   fy hena 7aga 3'alat
  
//   //loop in 8 array of roadArr
//   for(i = 0; i < roadArr.length; i++)
//   {
//     //loop in each array in elements of roadArr 
//     for(y = 0; y < roadArr[i].length; y++)
//     {
//       //checking roadNames length if zero push 3la tool
//       if(roadNames.length == 0)
//       {
//         roadNames.push(roadArr[i][y])
//       }
//       //if not compare b2a
//       else 
//       {
//         // loop 3la kol al elements aly mawgoda fel roadNames
//         for(k = 0; k < roadNames.length; k++)
//         {
//           //law lsa mwslnash a5er al roadNames yb2a w hia hia yb2a continue wala ay andhash
//           if(k != roadNames.length - 1)
//             { 
//               if(roadNames[k] == roadArr[i][y])
//               {
//                 break;
//               } 
//             }
//             //law wslna le a5er al roadNames yb2a law msh hia hia ne push bardo 
//           else if(k == roadNames.length - 1)
//             {
//               if(roadNames[k] == roadArr[i][y])
//               {
//                 break
//               } 
//               else
//                 {
//                   roadNames.push(roadArr[i][y]);
//                 }
//             }
//         }
//       }
//     }
//   }
//   // console.log(roadNames)
  
//     var dom = document.getElementById('stacked');
//     var myChart3 = echarts.init(dom, 'dark', {
//     renderer: 'canvas',
//     useDirtyRect: false
//   });
//   var app = {};
  
//   var option;
  
//   option = {
//     tooltip: {
//       axisPointer: {
//         type: 'shadow'
//       }
//     },
//     xAxis: [
//       {
//         type: 'category',
//         data: typeOfDataGrouped
//       }
//     ],
//     yAxis: [
//       {
//         type: 'value'
//       }
//     ],
//     series: [
//     ]
//   };
  
//   for(m = 0; m < 8; m++)
//   {
//     option.series.push(
//       {
//         name: roadNames[m],
//         type: 'bar',
//         emphasis: {
//           focus: 'series'
//         },
//         data: []
//       }
//     );
//     ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     for(n = 0; n < typeOfDataGrouped.length; n++)
//     {
//       // console.log("type of data loop: ", typeOfDataGrouped[n])
//       for(s = 0; s < roadArr[n].length; s++)
//       {
//         if(s == roadArr[n][s].length - 1)
//         {
//           if(option.series[m].name == roadArr[n][s])
//           {
//             option.series[m].data.push(arrValues[n][s]);
//             break;
//           }
//           else
//           {
//             option.series[m].data.push(0)
//           }
//         }
//         else 
//         {
//           if(option.series[m].name == roadArr[n][s])
//           {
//             option.series[m].data.push(arrValues[n][s]);
//             break;
//           }
//           else
//           {
//             continue;
//           }
//         }
//       }
//     }
//   }
  
//   if (option && typeof option === 'object') {
//     myChart3.setOption(option);
//   }
//   window.addEventListener('resize', myChart3.resize);
//   console.log(arrValues)
//   }
//   // --------------------------------------------------------------------------------------------------------------------------------------
  

------------------------------------------------------------------------------------------------------------------
var dom = document.getElementById("gauge");
var myChart4 = echarts.init(dom, "dark", {
  renderer: "canvas",
  useDirtyRect: false,
});
var app = {};

var option;

option = {
  tooltip: {
    formatter: "{a} <br/>{b} : {c}",
  },
  series: [
    {
      //name on tooltip
      name: "Pressure",
      type: "gauge",
      radius: "95%",
      progress: {
        show: true,
      },
      detail: {
        valueAnimation: true,
        formatter: "{value}",
      },
      data: [
        {
          name: "Max Speed",
          value: 50,
        },
      ],
    },
  ],
};

//array for max speed of each road is connected with roadNames index array
var maxSpeed = []


if (option && typeof option === "object") {
  myChart4.setOption(option);
}

window.addEventListener("resize", myChart4.resize);
// -----------------------------------------------------------------------------------
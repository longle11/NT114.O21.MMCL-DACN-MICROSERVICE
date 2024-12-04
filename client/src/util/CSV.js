export const ExportCSV = (dataHeader, dataRow, fileName) => {
    // Convert the data array into a CSV string
    const csvString = [
        dataHeader.map(field => `${field.title} (${field.dataIndex})`),
        ...dataRow.map(issue => {
            const objs = Object.keys(issue)
            return objs.map(obj => issue[obj])
        })
    ]
        .map(row => row.join("\t"))
        .join("\n");

    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: 'text/csv' });

    // // Generate a download link and initiate the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const csvFileToArray = (string, character) => {
    const setChar = character === "\\t" ? "\t" : `${character}`
    const csvHeader = string?.slice(0, string.indexOf("\n")).split(setChar)
    const csvRows = string?.slice(string.indexOf("\n") + 1).split("\n");
    const array = csvRows?.map(i => {
        const values = i.split(setChar);
        const obj = csvHeader.reduce((object, header, index) => {
            object[header] = values[index];
            return object;
        }, {});
        return obj;
    });

    console.log("array ", array);


    return array
};
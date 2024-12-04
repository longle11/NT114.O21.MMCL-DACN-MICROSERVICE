import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getBurndownChartInfo } from '../../../../redux/actions/ReportAction'
import { Breadcrumb, Table } from "antd";
import { GetProjectAction, GetSprintAction } from '../../../../redux/actions/ListProjectAction';
import { useParams, NavLink } from 'react-router-dom';

import dayjs from 'dayjs'
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment'
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    Tooltip,
    Legend
);


export default function BurndownChart() {
    const burnchartInfo = useSelector(state => state.report.info)
    const projectInfo = useSelector(state => state.listProject.projectInfo)
    const sprintInfo = useSelector(state => state.listProject.sprintInfo)
    const { id, sprintId } = useParams()
    const dispatch = useDispatch()

    useEffect(() => {
        if (typeof id?.toString() === 'string') {
            if (typeof sprintId?.toString() === 'string') {
                dispatch(getBurndownChartInfo(id, sprintId))
                dispatch(GetSprintAction(sprintId))
            }
            dispatch(GetProjectAction(id, null, null))

        }
    }, [])

    const calculateStoryPointGuideline = (listday) => {
        const minusDayOff = listday?.reduce((total, currentDay) => {
            if (!['Sun', 'Sat'].includes(dayjs(currentDay).format('ddd'))) {
                return ++total
            }
            return total
        }, 0)
        const storyPointEstimate = burnchartInfo?.total_story_point / (minusDayOff)
        var totalStoryPoint = burnchartInfo?.total_story_point

        const data = listday?.map((currentDate, index) => {
            if (dayjs(currentDate).format('ddd') === 'Sun' || dayjs(currentDate).subtract(1, 'day').format('ddd') === 'Sun') {
                return {
                    y: totalStoryPoint,
                    x: dayjs(currentDate).format('DD/MM/YYYY]')
                }
            }
            totalStoryPoint -= storyPointEstimate
            return {
                y: totalStoryPoint,
                x: dayjs(currentDate).format('DD/MM/YYYY]')
            }
        })

        return data
    }

    const calculateRemaining = () => {
        const remainingData = [];
        const current_date = new Date(); // Ngày hiện tại
        const start = new Date(burnchartInfo?.start_date); // Ngày bắt đầu
        const format = "DD/MM/YYYY hh:mm A"
        // Lặp từ start đến current_date_date
        while (start <= current_date) {
            if(remainingData.length === 0) {
                burnchartInfo?.story_point_data?.forEach(value => {
                    remainingData.push({
                        x: dayjs(value.current_time).format(format),
                        y: value.remaining,
                        data: value
                    })
                })
            }
            start.setHours(start.getHours() + 1);            
            
            if (start <= current_date && dayjs(dayjs(start).format(format), format).isAfter(dayjs(remainingData[remainingData.length - 1].x, format))) {
                remainingData.push({
                    x: dayjs(start).format(format),
                    y: burnchartInfo.current_story_point_remaining,
                    data: null
                })
            }
        }
        return remainingData
    }

    function getDatesInRange(startDate, endDate) {
        const dates = [];
        const [day, month, year] = dayjs(startDate).format("DD/MM/YYYY").split("/").map(Number);
        const currentDate = new Date(year, month - 1, day, 12, 0, 0)
        while (currentDate <= new Date(endDate)) {
            dates.push(dayjs(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
        }
        return dates;
    }


    const chartData = {
        labels: [],
        datasets: [
            {
                label: "Guideline",
                data: calculateStoryPointGuideline(getDatesInRange(burnchartInfo?.start_date, burnchartInfo?.end_date)),
                borderColor: 'blue',
                pointRadius: 0,
                hitRadius: 0,
                borderWidth: 2,
            },
            {
                label: "Remaining Values",
                data: calculateRemaining(),
                pointRadius: calculateRemaining()?.map(value => !value['data'] ? 0 : 3),
                stepped: true,
                backgroundColor: '#FFD580',
                borderColor: '#d04437',
                borderWidth: 2
            }
        ]
    }

    const columns = [
        {
            title: 'Date',
            dataIndex: 'current_time',
            key: 'current_time',
            render: (text, record, index) => {
                return dayjs(record.current_time).format('DD/MMM/YYYY hh:mm A')
            }
        },
        {
            title: 'Issue',
            dataIndex: 'issue_ordinal_number',
            key: 'issue_ordinal_number',
            render: (text, record, index) => {
                return <NavLink to={`/projectDetail/${id}/issues/issue-detail/${record.issue_id}`}>{projectInfo?.key_name} {record.issue_ordinal_number}</NavLink>
            }
        },
        {
            title: 'Event Type',
            dataIndex: 'event_type',
            key: 'event_type',
        },
        {
            title: 'Event Detail',
            dataIndex: 'event_detail',
            key: 'event_detail',
        },
        {
            title: 'Inc.',
            dataIndex: 'increase',
            key: 'increase',
            render: (text, record, index) => {
                if (record.increase > 0) {
                    return text
                }
                return null
            }
        },
        {
            title: 'Dec.',
            dataIndex: 'decrease',
            key: 'decrease',
            render: (text, record, index) => {
                if (record.decrease > 0) {
                    return text
                }
                return null
            }
        },
        {
            title: 'Remaining',
            dataIndex: 'remaining',
            key: 'remaining',
        }
    ];

    const renderTableBody = (textBody) => {
        const tableBody = document.createElement('tbody');
        const colors = '#ffff';
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = colors.borderColor;
        span.style.borderWidth = '2px';
        span.style.marginRight = '10px';
        span.style.fontSize = '10px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = 0;

        const td = document.createElement('td');
        td.style.borderWidth = 0;

        const text = document.createTextNode(textBody);

        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);

        return tableBody
    }


    const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = 1;
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-50%, 0)';
            tooltipEl.style.transition = 'all .1s ease';

            const table = document.createElement('table');
            table.style.margin = '0px';

            tooltipEl.appendChild(table);
            chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
    };

    const columnHigligher = {
        id: "columnHigligher",
        beforeDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart
            const angle = Math.PI / 180
            for (let index = 0; index < pluginOptions.startDate.length; index++) {
                const startDate = new Date(pluginOptions.startDate[index]).setHours(0, 0, 0, 0)
                const endDate = new Date(pluginOptions.endDate[index]).setHours(0, 0, 0, 0)

                ctx.fillStyle = '#dddd'
                ctx.fillRect(x.getPixelForValue(startDate), top, x.getPixelForValue(endDate) - x.getPixelForValue(startDate), height)

                ctx.fillStyle = 'green'
                ctx.font = 'bold 10px sans-serif'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('Day off', (x.getPixelForValue(startDate) + x.getPixelForValue(endDate)) / 2, height / 2 + top)
            }
        }
    }

    const externalTooltipHandler = (context) => {
        if (!context.tooltip?.dataPoints) return null
        const data = context.tooltip?.dataPoints[0]?.raw?.data;

        // Tooltip Element
        const { chart, tooltip } = context;
        const tooltipEl = getOrCreateTooltip(chart);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set Text
        if (data) {
            const tableHead = document.createElement('thead');

            const tr = document.createElement('tr');
            tr.style.borderWidth = 0;

            const th = document.createElement('th');
            th.style.borderWidth = 0;
            const text = document.createTextNode(`${projectInfo?.key_name} ${data.issue_ordinal_number}`);

            th.appendChild(text);
            tr.appendChild(th);
            tableHead.appendChild(tr);

            const tableBody1 = renderTableBody(`${data.event_type}`)
            const tableBody2 = renderTableBody(`${data.event_detail}`)
            var tableBody3 = null
            if (data.increase !== 0 && data.decrease === 0) {
                tableBody3 = renderTableBody(`▲Story Points: ${data.increase}`)
            } else if (data.decrease !== 0 && data.increase === 0) {
                tableBody3 = renderTableBody(`▲Story Points: -${data.decrease}`)
            } else {
                tableBody3 = renderTableBody(`▲Story Points: 0`)
            }
            const tableBody4 = renderTableBody(`${dayjs(new Date(data.current_time)).format("DD/MMM/YYYY hh:mm A")}`)

            const tableRoot = tooltipEl.querySelector('table');

            // Remove old children
            while (tableRoot.firstChild) {
                tableRoot.firstChild.remove();
            }

            // Add new children
            tableRoot.appendChild(tableHead);
            tableRoot.appendChild(tableBody1);
            if (data.event_detail !== "") {
                tableRoot.appendChild(tableBody2);
            }
            tableRoot.appendChild(tableBody3);
            tableRoot.appendChild(tableBody4);
        }

        const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.font = tooltip.options.bodyFont.string;
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
    };

    const findDayOffArrs = () => {
        const end = new Date(burnchartInfo?.end_date);
        const start = new Date(burnchartInfo?.start_date);

        const startDate = []
        const endDate = []

        // Lặp từ start đến currentDate
        while (start <= end) {
            if (dayjs(start).format('ddd') === 'Sat') {
                startDate.push(dayjs(start))
                endDate.push(dayjs(start).add(2, 'day'))
                start.setDate(start.getDate() + 2);
            } if (dayjs(start).format('ddd') === 'Sun') {
                startDate.push(dayjs(start))
                endDate.push(dayjs(start).add(1, 'day'))
                start.setDate(start.getDate() + 1);
            }
            else {
                start.setDate(start.getDate() + 1);
            }
        }


        return {
            startDate: startDate,
            endDate: endDate
        }
    }

    const config = {
        type: 'line',
        data: chartData,
        options: {
            plugins: {
                legend: {
                    onClick: null
                },
                tooltip: {
                    enabled: false,
                    position: 'average',
                    external: externalTooltipHandler
                },
                columnHigligher: findDayOffArrs()
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        parser: "DD/MM/YYYY hh:mm A",
                        tooltipFormat: 'DD/MM/YYYY HH:mm A'
                    },
                    title: {
                        display: true,
                        text: 'Time',
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                    },
                    min: dayjs(burnchartInfo?.start_date).format("DD/MM/YYYY"),
                    max: (dayjs(burnchartInfo?.end_date).add(1, 'day')).format("DD/MM/YYYY"),
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    title: {
                        display: true,
                        text: 'Story point',
                    }
                },
            },
        },
        plugins: [columnHigligher]
    };
    return (
        <div>
            <Breadcrumb
                style={{ marginBottom: 10 }}
                items={[
                    {
                        title: <a href="/manager">Projects</a>,
                    },
                    {
                        title: <a href={`/projectDetail/${id}/board`}>{projectInfo?.name_project}</a>,
                    },
                    {
                        title: <a href="/manager">Reports</a>,
                    }
                ]}
            />
            <div style={{ overflowY: 'auto', height: '85vh' }}>

                <h4>Burndown Chart</h4>
                <div className='report-burndown_instruction'>
                    <h5>How to read this chart</h5>
                    <p>Track the total work remaining and project the likelihood of achieving the sprint goal. This helps your team manage its progress and respond accordingly.</p>
                </div>
                <hr />
                <div>
                    <span>{sprintInfo?.sprint_name}</span>
                </div>
                <div style={{ width: '1024px', marginTop: 10 }}>
                    <Line {...config} />
                </div>
                <Table
                    dataSource={burnchartInfo?.story_point_data}
                    pagination={false}
                    columns={columns} />
            </div>
        </div>
    )
}

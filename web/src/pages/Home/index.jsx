import './style.css';
import { useContext } from 'react';
import { ApiServiceContext, machine } from '../../services/ApiService.js';
import { useEffect, useRef, useState } from 'preact/hooks';
import { computed } from '@preact/signals';
import { Chart, LineController, TimeScale, LinearScale, PointElement, LineElement, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
Chart.register(LineController);
Chart.register(TimeScale);
Chart.register(LinearScale);
Chart.register(PointElement);
Chart.register(LineElement);
Chart.register(Filler);
Chart.register(Legend);

const modeMap = {
  0: 'Standby',
  1: 'Brew',
  2: 'Steam',
  3: 'Water',
};

const status = computed(() => machine.value.status);
const history = computed(() => machine.value.history);

function getChartData(data) {
  let end = new Date();
  let start = new Date(end.getTime() - 300000);
  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Current Temperature',
          borderColor: '#F44336',
          pointStyle: false,
          data: data.map((i, idx) => ({x: i.timestamp.toISOString(), y: i.currentTemperature}))
        },
        {
          label: 'Target Temperature',
          fill: true,
          borderColor: '#03A9F4',
          pointStyle: false,
          data: data.map(((i, idx) => ({x: i.timestamp.toISOString(), y: i.targetTemperature})))
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          display: true,
        },
        title: {
          display: true,
          text: 'Temperature History'
        }
      },
      animation: false,
      scales: {
        y: {
          type: 'linear',
          min: 0,
          max: 160,
          ticks: {
            callback: value => { return `${value} °C` }
          }
        },
        x: {
          type: 'time',
          min: start,
          max: end,
          time: {
            unit: 'second',
            displayFormats: {
              second: 'HH:mm:ss'
            }
          },
          ticks: {
            source: 'auto'
          }
        }
      }
    },
  };
}

export function Home() {
  const apiService = useContext(ApiServiceContext);
  const [chart, setChart] = useState(null);
  const ref = useRef();
  const chartData = getChartData(machine.value.history);
  useEffect(() => {
    const ct = new Chart(ref.current, chartData);
    setChart(ct);
  }, [ref]);
  useEffect(() => {
    const cd = getChartData(machine.value.history);
    chart.data = cd.data;
    chart.options = cd.options;
    chart.update();
  }, [machine.value.history, chart]);
  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 md:gap-2">
        <div className="sm:col-span-12">
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </div>
        <div
          className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-4 xl:col-span-4"
        >
          <dl>
            <dt className="text-2xl font-bold">{modeMap[status.value.mode] || 'Standby'}</dt>
            <dd className="text-sm font-medium text-slate-500">
              Mode
            </dd>
          </dl>
        </div>
        <div
          className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-4 xl:col-span-4"
        >
          <dl>
            <dt className="text-2xl font-bold">{status.value.currentTemperature || 0} °C</dt>
            <dd className="text-sm font-medium text-slate-500">
              Current Temperature
            </dd>
          </dl>
        </div>
        <div
          className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-4 xl:col-span-4"
        >
          <dl>
            <dt className="text-2xl font-bold">{status.value.targetTemperature || 0} °C</dt>
            <dd className="text-sm font-medium text-slate-500">
              Target Temperature
            </dd>
          </dl>
        </div>
        {/*
        <div
          className="rounded-lg border border-slate-200 bg-white p-6 sm:col-span-6 xl:col-span-3"
        >
          <dl>
            <dt className="text-2xl font-bold">{status?.profile || 'LM Leva 2'}</dt>
            <dd className="text-sm font-medium text-slate-500">
              Current Profile
            </dd>
          </dl>
        </div>
        */ }
        <div
          className="overflow-hidden rounded-xl border border-slate-200 bg-white sm:col-span-12"
        >
          <div className="px-6 pt-6">
            <h2 className="text-2xl font-bold">Overview</h2>
          </div>

          <div className="p-6">
              <canvas className="w-full" ref={ref}>
              </canvas>
          </div>
        </div>
      </div>
    </>
  );
}

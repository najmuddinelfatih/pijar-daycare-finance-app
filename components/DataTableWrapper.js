import dynamic from "next/dynamic";
export default dynamic(() => import("react-data-table-component"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

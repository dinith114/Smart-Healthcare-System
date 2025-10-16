export default function PatientSummaryCard({ data = {} }) {
  const {
    name = "-",
    address = "-",
    phone = "-",
    email = "-",
    gender = "-",
    dob,
  } = data;
  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4">
      <h3 className="font-semibold text-[#2f3e2d] mb-3">Patient Information</h3>
      <div className="flex items-start gap-4">
        <div className="w-28 h-28 rounded-lg bg-[#c7d7c3]" />
        <dl className="text-sm">
          <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1">
            <dt className="font-semibold">Name</dt>
            <dd>{name}</dd>
            <dt className="font-semibold">Address</dt>
            <dd>{address}</dd>
            <dt className="font-semibold">Contact</dt>
            <dd>{phone}</dd>
            <dt className="font-semibold">Email</dt>
            <dd>{email}</dd>
            <dt className="font-semibold">Gender</dt>
            <dd>{gender}</dd>
            <dt className="font-semibold">Age</dt>
            <dd>
              {dob
                ? Math.max(
                    0,
                    new Date().getFullYear() - new Date(dob).getFullYear()
                  ) + " years"
                : "-"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

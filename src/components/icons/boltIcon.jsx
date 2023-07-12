function BoltIcon({ additionalClasses }) {
  let classes = 'boltIcon';
  if (additionalClasses) {
    let arr = additionalClasses.split(' ');
    arr.push(classes);
    classes = arr.join(' ');
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="1.25rem"
      height="1.25rem"
      class={classes}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

export default BoltIcon;

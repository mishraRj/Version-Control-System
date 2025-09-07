import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Code = () => {
  const { repoId } = useParams();
  const [repo, setRepo] = useState();
  // Fetch Repo
  useEffect(() => {
    const fetchRepository = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/${repoId}`);
        const data = await response.json();
        console.log(data[0]);
        setRepo(data[0]);
      } catch (err) {
        console.log("Error while passing repositories", err);
      }
    };

    fetchRepository();
  }, []);

  return (
    <>
      {repo ? (
        <>
          <h1>Repository: {repo.name}</h1>
          <p>{repo.description}</p>
          <p>Visibility: {repo.visibility}</p>
          <p>Owner: {repo.owner?.username}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Code;

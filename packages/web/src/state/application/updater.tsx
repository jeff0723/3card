import { useQuery } from "@apollo/client";
import { RECOMMENDED_PROFILES_QUERY } from "graphql/query/recommended-profiles";
import { useEffect } from "react";
import { setLoadingNews, updateNews } from "state/application/reducer";
import { useAppDispatch } from "state/hooks";
import { updateRecommedUser, updateRecommendedProfiles } from "./reducer";
type Props = {};

const ApplicationUpdater = (props: Props) => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useQuery(RECOMMENDED_PROFILES_QUERY, {
    onCompleted(data) {
      console.log(
        "[Query]",
        `Fetched ${data?.recommendedProfiles?.length} recommended profiles`
      );
      console.log("fetched:", data);
      dispatch(
        updateRecommendedProfiles({
          recommendedProfiles: data?.recommendedProfiles,
        })
      );
      //should add some logic to filter and generate a random profile
      dispatch(
        updateRecommedUser({ recommendUser: data?.recommendedProfiles[0] })
      );
    },
    onError(error) {
      console.error("[Query Error]", error);
    },
  });
  const fetchFeed = async () => {
    dispatch(setLoadingNews({ loadingNews: true }))
    const res = await fetch('http://localhost:3000/api/get-today-news').finally(() => dispatch(setLoadingNews({ loadingNews: false })))
    dispatch(updateNews({ news: await res.json() }))
  }
  useEffect(() => {
    fetchFeed()
  }, [])
  return null;
};

export default ApplicationUpdater;

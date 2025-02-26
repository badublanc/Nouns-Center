import React, { useState, useEffect } from 'react';

import { truncateEthAddress } from '../../lib/utils';
import { signUser } from '../../lib/signUser';
import { useAccount, useSigner } from 'wagmi';

import Heart from '../icons/heart-icon';

import { useEnsName } from 'wagmi';
import Link from 'next/link';

interface IdeaCardProps {
  id: number;
  title: string;
  tldr: string;
  submittedBy: string;
  date: string;
  votes: number;
  liked: boolean;
}

const IdeaCard = ({
  id,
  title,
  tldr,
  submittedBy,
  date,
  votes,
  liked,
}: IdeaCardProps) => {
  const [isLiked, setIsLiked] = useState(liked);
  const [voteCount, setVoteCount] = useState(votes);

  const { data: ensName } = useEnsName({ address: submittedBy });
  const { data: accountData } = useAccount();
  const { data: signer } = useSigner();

  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  const runLikesService = async (val: boolean) => {
    return await fetch('/api/likes', {
      method: 'POST',
      body: JSON.stringify({
        liked: val,
        ideaId: id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const handleToggleHeart = async () => {
    if (await signUser(accountData, signer)) {
      const val = !isLiked;
      let currVoteCount = voteCount;
      setVoteCount(val ? voteCount + 1 : voteCount - 1);
      setIsLiked(val);
      const response = await runLikesService(val);
      if (response.status == 403) {
        setVoteCount(currVoteCount);
        setIsLiked(isLiked);
      }
    } else {
      // TODO: fill this in
    }
  };

  return (
    <div className="">
      <div className="mt-5">
        <div className="rounded-xl bg-gray-50 dark:bg-white px-6 py-5 min-h-[225px] sm:flex sm:items-start sm:justify-between flex-col">
          <div className="sm:flex sm:items-start gap-2">
            <div className="flex flex-col items-center cursor-pointer text-nouns-dark-grey hover:text-gray-300 transition">
              <button onClick={handleToggleHeart}>
                <Heart selected={isLiked} />
              </button>
              <div className="text-xs">{voteCount}</div>
            </div>

            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="text-lg text-nouns tracking-wide font-medium text-gray-900 leading-none">
                {title}
              </div>

              <div className="text-black pt-4 line-clamp-3">{tldr}</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 sm:flex-shrink-0 justify-between  flex w-full">
            <div className="mt-1 text-sm text-gray-600 sm:flex flex-col">
              <div className="italic">
                By:{' '}
                <span className="">
                  {ensName ? ensName : truncateEthAddress(submittedBy)}
                </span>
              </div>

              <div className="mt-1 sm:mt-0">
                {new Date(date).toLocaleDateString('en-us', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            <Link href={`/ideas/${id}`}>
              <a className="inline-flex cursor-pointer items-center font-medium transition rounded-md text-blue-500 hover:text-gray-700 underline">
                Read More
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;

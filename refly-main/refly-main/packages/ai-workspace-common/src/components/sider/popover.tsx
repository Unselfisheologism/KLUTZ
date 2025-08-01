import { Button, Popover } from 'antd';
import { SiderLayout } from './layout';
import { SideRight } from 'refly-icons';

import { Logo } from '../common/logo';
import { GithubStar } from '../common/github-star';
import cn from 'classnames';
import { useState } from 'react';

interface SiderPopoverProps {
  children?: React.ReactNode;
  childrenClassName?: string;
  showBrand?: boolean;
  align?: {
    offset: [number, number];
  };
}

export const SiderPopover = (props: SiderPopoverProps) => {
  const { children, childrenClassName, align = { offset: [0, -40] }, showBrand = true } = props;

  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className={cn('flex items-center gap-2', childrenClassName)}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
        <Popover
          zIndex={11}
          overlayInnerStyle={{ padding: 0, boxShadow: 'none', border: 'none' }}
          className="shadow-none"
          arrow={false}
          placement="bottom"
          align={align}
          open={isVisible}
          content={
            <div className="animate-slide-in-left">
              <SiderLayout source="popover" />
            </div>
          }
        >
          {children || (
            <Button
              type="text"
              icon={<SideRight size={20} />}
              className="hover:bg-refly-tertiary-hover transition-colors duration-200"
            />
          )}
        </Popover>
      </div>
      {showBrand && (
        <>
          <Logo />
          <GithubStar />
        </>
      )}
    </div>
  );
};

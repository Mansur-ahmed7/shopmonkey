'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface StarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const StarButton = forwardRef<HTMLButtonElement, StarButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'relative px-4 py-2 font-medium text-sm rounded-lg border-2 transition-all duration-300 ease-in-out cursor-pointer overflow-visible inline-flex items-center gap-2';
    
    const variants = {
      default: 'bg-[#0066FF] text-white border-[#0066FF] hover:bg-transparent hover:text-[#0066FF] shadow-[0_0_0_#0066FF8c] hover:shadow-[0_0_25px_#0066FF8c]',
      secondary: 'bg-green-500 text-white border-green-500 hover:bg-transparent hover:text-green-500 shadow-[0_0_0_#10b9818c] hover:shadow-[0_0_25px_#10b9818c]',
      outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className, 'group')}
        {...props}
      >
        {children}
        
        {/* Star 1 */}
        <div className="star-1 absolute top-[20%] left-[20%] w-6 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0.05,0.83,0.43,0.96)] group-hover:top-[-80%] group-hover:left-[-30%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>

        {/* Star 2 */}
        <div className="star-2 absolute top-[45%] left-[45%] w-4 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover:top-[-25%] group-hover:left-[10%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>

        {/* Star 3 */}
        <div className="star-3 absolute top-[40%] left-[40%] w-1.5 h-auto -z-10 transition-all duration-1000 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover:top-[55%] group-hover:left-[25%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>

        {/* Star 4 */}
        <div className="star-4 absolute top-[20%] left-[40%] w-2 h-auto -z-10 transition-all duration-800 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover:top-[30%] group-hover:left-[80%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>

        {/* Star 5 */}
        <div className="star-5 absolute top-[25%] left-[45%] w-4 h-auto -z-10 transition-all duration-600 [transition-timing-function:cubic-bezier(0,0.4,0,1.01)] group-hover:top-[25%] group-hover:left-[115%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>

        {/* Star 6 */}
        <div className="star-6 absolute top-[5%] left-[50%] w-1.5 h-auto -z-10 transition-all duration-800 ease group-hover:top-[5%] group-hover:left-[60%] group-hover:z-[2] drop-shadow-[0_0_0_#fffdef] group-hover:drop-shadow-[0_0_10px_#fffdef]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.11 815.53" className="fill-[#fffdef]">
            <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z"></path>
          </svg>
        </div>
      </button>
    );
  }
);

StarButton.displayName = 'StarButton';

export { StarButton };
